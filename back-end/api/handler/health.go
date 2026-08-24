package handler

import (
	"github.com/gin-gonic/gin"
)

func (h *Handler) Health(ctx *gin.Context) {
	ctx.Status(200)
}
