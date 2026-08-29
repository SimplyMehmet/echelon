package router

import (
	"echelon.com/api/handler"
	"github.com/gin-gonic/gin"
)

func SetupTeamRoutes(r *gin.RouterGroup, h *handler.Handler) {
	r = r.Group("team")
	r.GET("", h.GetAllTeams)
}
