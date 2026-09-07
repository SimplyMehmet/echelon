package api

import (
	"fmt"
	"github.com/SimplyMehmet/echelon/back-end/api/router"
	"github.com/SimplyMehmet/echelon/back-end/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func RunServer(services *services.Services) {
	r := gin.New()
	r.Use(cors.Default())

	v1 := r.Group("/api/v1")
	router.SetupRouterV1(v1, services)
	if err := r.Run(); err != nil {
		panic(fmt.Errorf("error starting api err => %v", err))
	}
}
