package sql

import (
	"fmt"

	"echelon.com/config"
	"echelon.com/repository/sql/models"
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

	err = migrate(db)
	if err != nil {
		return nil, fmt.Errorf("could not migrate database: %v", err)
	}

	return &Repository{
		db: db,
	}, nil
}

func migrate(db *gorm.DB) error {
	err := db.AutoMigrate(&models.Player{}, &models.Team{})
	if err != nil {
		return fmt.Errorf("could not automigrate db models err %v", err)
	}

	teams := []string{"Dragon", "Mantis", "Phoenix", "Tarantula"}
	for _, team := range teams {
		db = db.FirstOrCreate(&models.Team{}, models.Team{Name: team})
		if db.Error != nil {
			return fmt.Errorf("could not create Team %s err: %v", team, err)
		}
	}

	return nil
}
