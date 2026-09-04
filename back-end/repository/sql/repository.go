package sql

import (
	"echelon.com/repository/startgg"
	"fmt"
	"github.com/google/uuid"
	"gorm.io/gorm/clause"

	"echelon.com/config"
	"echelon.com/repository/sql/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func New(startGGData []startgg.MappedPlayer) (*Repository, error) {
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

	err = migrate(db, startGGData)
	if err != nil {
		return nil, fmt.Errorf("could not migrate database: %v", err)
	}

	return &Repository{
		db: db,
	}, nil
}

func migrate(db *gorm.DB, startGGData []startgg.MappedPlayer) error {
	err := db.AutoMigrate(&models.Player{}, &models.Team{})
	if err != nil {
		return fmt.Errorf("could not automigrate db models err %v", err)
	}

	teams := []string{"Dragon", "Mantis", "Phoenix", "Tarantula"}
	teamIdsByName := map[string]uuid.UUID{}
	for _, team := range teams {
		var model models.Team
		db = db.FirstOrCreate(&model, models.Team{Name: team})
		if db.Error != nil {
			return fmt.Errorf("could not create Team %s err: %v", team, err)
		}

		teamIdsByName[team] = model.ID
	}

	for _, player := range startGGData {
		var model models.Player
		teamID, exists := teamIdsByName[player.Team]
		if !exists {
			model.MapStartGGDataIntoStruct(player, nil)
		} else {
			model.MapStartGGDataIntoStruct(player, &teamID)
		}

		db = db.Model(&models.Player{}).Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "start_gg_id"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"score_current",
				"team_id",
				"score_total",
				"attended",
				"name",
			}),
		}).Create(&model)
		if db.Error != nil {
			return fmt.Errorf("could not create Player %s err: %v", player.Team, db.Error)
		}
	}

	return nil
}
