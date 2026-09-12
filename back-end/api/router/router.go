package router

import (
	"github.com/SimplyMehmet/echelon/back-end/api/handler"
	"github.com/SimplyMehmet/echelon/back-end/services"
	"github.com/gin-gonic/gin"
)

func SetupRouterV1(r *gin.RouterGroup, services *services.Services) {
	h := handler.New(services)
	SetupHealthRoutes(r, h)
	SetupPlayerRoutes(r, h)
	SetupTeamRoutes(r, h)
	SetupEventRoutes(r, h)
}
