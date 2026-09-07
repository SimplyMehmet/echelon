package main

import (
	"fmt"
	"github.com/SimplyMehmet/echelon/back-end/api"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql"
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg"
	"github.com/SimplyMehmet/echelon/back-end/services"
)

func main() {
	startGGRepository := startgg.New()
	startGGData, err := startGGRepository.Start()
	if err != nil {
		panic(fmt.Errorf("failed to connect to startGG api %v", err))
	}
	sqlRepository, err := sql.New(startGGData)
	if err != nil {
		panic(fmt.Errorf("failed to connect database %v", err))
	}

	serviceCollection := services.New(sqlRepository, startGGRepository)
	api.RunServer(serviceCollection)
}
