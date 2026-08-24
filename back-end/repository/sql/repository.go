package sql

import (
	"echelon.com/config"
	"echelon.com/repository/sql/models"
	"fmt"
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
	err := db.AutoMigrate(&models.Player{})
	return err
}
