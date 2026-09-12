package main

import (
	"fmt"
	"github.com/SimplyMehmet/echelon/back-end/api"
	"github.com/SimplyMehmet/echelon/back-end/config"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql"
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg"
	"github.com/SimplyMehmet/echelon/back-end/services"
)

func main() {
	cfg := config.Load()

	sqlRepository, err := sql.New()
	if err != nil {
		panic(fmt.Errorf("failed to connect database %v", err))
	}

	if cfg.MigrateDatabase {
		startGGRepository := startgg.New()
		startGGPlayerData, startGGSeasonData, migrateErr := startGGRepository.ImportStartGGData()
		if migrateErr != nil {
			panic(fmt.Errorf("failed to connect to startGG api %v", migrateErr))
		}

		migrateErr = sqlRepository.Migrate(startGGPlayerData, startGGSeasonData)
		if migrateErr != nil {
			panic(fmt.Errorf("failed to migrate startGG api %v", migrateErr))
		}
	}

	serviceCollection := services.New(sqlRepository)
	api.RunServer(serviceCollection)
}
