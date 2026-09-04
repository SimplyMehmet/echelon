package main

import (
	"echelon.com/api"
	"echelon.com/repository/sql"
	"echelon.com/repository/startgg"
	"echelon.com/services"
	"fmt"
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
