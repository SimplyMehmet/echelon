package router

import (
	"github.com/SimplyMehmet/echelon/back-end/api/handler"
	"github.com/gin-gonic/gin"
)

func SetupEventRoutes(r *gin.RouterGroup, h *handler.Handler) {
	group := r.Group("/event")
	group.GET("", h.GetAllEvents)
}
