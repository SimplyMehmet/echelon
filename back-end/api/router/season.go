package router

import (
	"github.com/SimplyMehmet/echelon/back-end/api/handler"
	"github.com/gin-gonic/gin"
)

func SetupSeasonRoutes(r *gin.RouterGroup, h *handler.Handler) {
	group := r.Group("/season")
	group.GET("", h.GetAllSeasons)
}
