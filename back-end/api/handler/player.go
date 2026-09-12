package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) GetAllPlayers(ctx *gin.Context) {
	resp, err := h.services.PlayerService.GetAllPlayers()
	if err != nil {
		ctx.Status(http.StatusInternalServerError)
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, resp)
}
