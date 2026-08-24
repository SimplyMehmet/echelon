package router

import (
	"echelon.com/api/handler"
	"echelon.com/services"
	"github.com/gin-gonic/gin"
)

func SetupRouterV1(r *gin.RouterGroup, services *services.Services) {
	h := handler.New(services)
	SetupHealthRoutes(r, h)
	SetupPlayerRoutes(r, h)
}
