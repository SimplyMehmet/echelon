package sql

import (
	"fmt"

	"github.com/SimplyMehmet/echelon/back-end/config"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg"
	"github.com/google/uuid"
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

	err = db.SetupJoinTable(&models.Set{}, "Players", &models.PlayerSet{})
	if err != nil {
		return fmt.Errorf("could not setup join table: %v", err)
	}

	err = db.SetupJoinTable(&models.Player{}, "Sets", &models.PlayerSet{})
	if err != nil {
		return fmt.Errorf("could not setup join table: %v", err)
	}

	err = db.AutoMigrate(&models.Team{}, &models.Player{}, &models.Season{}, &models.Event{}, &models.PlayerEvent{})
	if err != nil {
		return fmt.Errorf("could not automigrate db models err %v", err)
	}
	teams := []string{"Dragon", "Mantis", "Phoenix", "Tarantula"}

	for _, team := range teams {
		model, err := r.FindOrCreateTeam(team)
		if err != nil {
			return fmt.Errorf("could not create Team %s err: %v", team, db.Error)
		}

		r.teamIDsByName[team] = model.ID
	}

	var events []models.Event
	mappedSets := make(map[string][]models.PlayerSet)
	for _, season := range startGGSeasonData {
		seasonModel, err := r.UpsertStartGGSeason(season)
		if err != nil {
			return fmt.Errorf("could not create Season %s err: %v", season.Name, db.Error)
		}

		for _, event := range season.Events {
			eventModel, err := r.UpsertStartGGEvent(event, seasonModel.ID)
			if err != nil {
				return fmt.Errorf("could not create StartGGEvent %s err: %v", event.ID, err)
			}

			events = append(events, eventModel)
			for _, set := range event.Sets {
				setModel, err := r.UpsertStartGGSet(set, eventModel.ID)
				if err != nil {
					return fmt.Errorf("could not create StartGGSet %s err: %v", set.ID, err)
				}

				for _, player := range set.Players {
					mappedSets[player.ID] = append(mappedSets[player.ID], models.PlayerSet{
						SetID: setModel.ID,
						Score: int(player.Score),
					})
				}
			}
		}
	}

	for _, player := range startGGPlayerData {
		playerModel, err := r.UpsertStartGGPlayer(player)
		if err != nil {
			return fmt.Errorf("could not create Player %s err: %v", player.Team, db.Error)
		}

		err = r.UpsertStartGGPlayerEventRelations(player.Placements, playerModel, events)
		if err != nil {
			return fmt.Errorf("could not create Player event relations err: %v", err)
		}

		for _, set := range mappedSets[player.StartGGID] {
			set.PlayerID = playerModel.ID
			_, err = r.UpsertPlayerSetRelation(set)
			if err != nil {
				return fmt.Errorf("could not create Player set relations err: %v", err)
			}
		}

	}

	return nil
}
