package main

import (
	"echelon.com/api"
	"echelon.com/repository/sql"
	"echelon.com/services"
	"fmt"
)

func main() {
	sqlRepository, err := sql.New()
	if err != nil {
		panic(fmt.Errorf("failed to connect database %v", err))
	}

	serviceCollection := services.New(sqlRepository)
	api.RunServer(serviceCollection)
}
