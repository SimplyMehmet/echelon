package handler

import (
	"echelon.com/api/types/request"
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) CreatePlayer(ctx *gin.Context) {
	var req request.CreatePlayerRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.Status(http.StatusBadRequest)
		ctx.Abort()
		return
	}

	err := h.services.PlayerService.CreatePlayer(req.Name)
	if err != nil {
		ctx.Status(http.StatusInternalServerError)
		ctx.Abort()
		return
	}

	ctx.Status(http.StatusOK)
}

func (h *Handler) GetAllPlayers(ctx *gin.Context) {
	resp, err := h.services.PlayerService.GetAllPlayers()
	if err != nil {
		ctx.Status(http.StatusInternalServerError)
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, resp)
}
