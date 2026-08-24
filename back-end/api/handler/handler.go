package handler

import "echelon.com/services"

type Handler struct {
	services *services.Services
}

func New(services *services.Services) *Handler {
	return &Handler{
		services: services,
	}
}
