package sql

import (
	"fmt"

	"github.com/SimplyMehmet/echelon/back-end/repository/startgg"
	"github.com/google/uuid"
	"gorm.io/gorm/clause"

	"github.com/SimplyMehmet/echelon/back-end/config"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func New() (*Repository, error) {
	cfg := config.Load()
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local",
		cfg.MariaDBRootUser,
		cfg.MariaDBRootPassword,
		cfg.MariaDBHost,
		cfg.MariaDBPort,
		cfg.MariaDBDatabase,
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("could not connect to database: %v", err)
	}

	repository := &Repository{
		db:            db,
		teamIDsByName: map[string]uuid.UUID{},
	}

	return repository, nil
}

func (r *Repository) Migrate(startGGPlayerData []startgg.MappedPlayer, startGGSeasonData []startgg.MappedSeason) error {
	db := r.db
	err := db.SetupJoinTable(&models.Event{}, "Players", &models.PlayerEvent{})
	if err != nil {
		return fmt.Errorf("could not setup join table: %v", err)
	}

	err = db.SetupJoinTable(&models.Player{}, "Events", &models.PlayerEvent{})
	if err != nil {
		return fmt.Errorf("could not setup join table: %v", err)
	}

	err = db.AutoMigrate(&models.Team{}, &models.Player{}, &models.Season{}, &models.Event{}, &models.PlayerEvent{})
	if err != nil {
		return fmt.Errorf("could not automigrate db models err %v", err)
	}
	teams := []string{"Dragon", "Mantis", "Phoenix", "Tarantula"}

	for _, team := range teams {
		var model models.Team
		db.FirstOrCreate(&model, models.Team{Name: team})
		if db.Error != nil {
			return fmt.Errorf("could not create Team %s err: %v", team, db.Error)
		}

		r.teamIDsByName[team] = model.ID
	}

	var events []models.Event
	for _, season := range startGGSeasonData {
		seasonModel := models.Season{
			Name:      season.Name,
			StartGGID: season.StartGGSourceSeason,
			Current:   season.Current,
		}

		db.Model(&models.Season{}).Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "start_gg_id"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"name",
			}),
		}).FirstOrCreate(&seasonModel, models.Season{Name: season.Name})

		if db.Error != nil {
			return fmt.Errorf("could not create Season %s err: %v", season.Name, db.Error)
		}

		for _, event := range season.Events {
			eventModel := models.Event{
				Name:         event.Name,
				SeasonID:     seasonModel.ID,
				StartsAt:     event.StartsAt,
				Location:     event.Location,
				StartGGID:    event.ID,
				DoublePoints: event.DoubleXP,
				Status:       event.State,
			}

			db.Model(&models.Event{}).
				Where("start_gg_id = ?", eventModel.StartGGID).
				Assign(map[string]interface{}{
					"starts_at":     eventModel.StartsAt,
					"double_points": eventModel.DoublePoints,
					"season_id":     eventModel.SeasonID,
					"location":      eventModel.Location,
					"name":          eventModel.Name,
				}).FirstOrCreate(&eventModel)

			if db.Error != nil {
				return fmt.Errorf("could not create Event %s err: %v", eventModel.Name, db.Error)
			}

			events = append(events, eventModel)
		}
	}

	for _, player := range startGGPlayerData {
		playerModel, err := r.UpsertStartGGPlayer(player)
		if err != nil {
			return fmt.Errorf("could not create Player %s err: %v", player.Team, db.Error)
		}

		err = r.CreatePlayerEventRelations(player.Placements, playerModel, events)
		if err != nil {
			return fmt.Errorf("could not create Player event relations err: %v", err)
		}
	}

	return nil
}
