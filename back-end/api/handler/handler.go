package handler

import "github.com/SimplyMehmet/echelon/back-end/services"

type Handler struct {
	services *services.Services
}

func New(services *services.Services) *Handler {
	return &Handler{
		services: services,
	}
}
