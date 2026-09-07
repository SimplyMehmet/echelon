package router

import (
	"github.com/SimplyMehmet/echelon/back-end/api/handler"
	"github.com/gin-gonic/gin"
)

func SetupHealthRoutes(r *gin.RouterGroup, h *handler.Handler) {
	r = r.Group("health")
	r.GET("", h.Health)
}
