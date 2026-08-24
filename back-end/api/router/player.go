package router

import (
	"echelon.com/api/handler"
	"github.com/gin-gonic/gin"
)

func SetupPlayerRoutes(r *gin.RouterGroup, h *handler.Handler) {
	r = r.Group("player")
	r.GET("", h.GetAllPlayers)
	r.POST("create", h.CreatePlayer)
}
