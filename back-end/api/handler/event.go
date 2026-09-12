package handler

import "github.com/gin-gonic/gin"

func (h *Handler) GetAllEvents(ctx *gin.Context) {
	ctx.Status(200)
}
