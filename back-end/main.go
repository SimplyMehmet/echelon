package main

import (
	"echelon.com/api"
	"echelon.com/repository/sql"
	"echelon.com/repository/startgg"
	"echelon.com/services"
	"fmt"
)

func main() {
	sqlRepository, err := sql.New()
	if err != nil {
		panic(fmt.Errorf("failed to connect database %v", err))
	}

	startGGRepository := startgg.New()
	serviceCollection := services.New(sqlRepository, startGGRepository)
	api.RunServer(serviceCollection)
}
