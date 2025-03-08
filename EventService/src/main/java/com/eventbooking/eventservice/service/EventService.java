package com.eventbooking.eventservice.service;

import com.eventbooking.eventservice.model.Event;
import com.eventbooking.eventservice.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {
    private final EventRepository eventRepository;

    @Autowired
    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Optional<Event> getEventById(String id) {
        return eventRepository.findById(id);
    }

    public Event createEvent(Event event) {
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        return eventRepository.save(event);
    }

    public Optional<Event> updateEvent(String id, Event eventDetails) {
        return eventRepository.findById(id)
                .map(existingEvent -> {
                    existingEvent.setTitle(eventDetails.getTitle());
                    existingEvent.setDescription(eventDetails.getDescription());
                    existingEvent.setDate(eventDetails.getDate());
                    existingEvent.setLocation(eventDetails.getLocation());
                    existingEvent.setPrice(eventDetails.getPrice());
                    existingEvent.setAvailableTickets(eventDetails.getAvailableTickets());
                    existingEvent.setImageUrl(eventDetails.getImageUrl());
                    existingEvent.setCategory(eventDetails.getCategory());
                    existingEvent.setUpdatedAt(LocalDateTime.now());
                    return eventRepository.save(existingEvent);
                });
    }

    public boolean deleteEvent(String id) {
        return eventRepository.findById(id)
                .map(event -> {
                    eventRepository.delete(event);
                    return true;
                })
                .orElse(false);
    }

    public boolean checkAvailability(String eventId, int requestedTickets) {
        return eventRepository.findById(eventId)
                .map(event -> event.getAvailableTickets() >= requestedTickets)
                .orElse(false);
    }

    public boolean updateTicketAvailability(String eventId, int bookedTickets) {
        return eventRepository.findById(eventId)
                .map(event -> {
                    if (event.getAvailableTickets() >= bookedTickets) {
                        event.setAvailableTickets(event.getAvailableTickets() - bookedTickets);
                        event.setUpdatedAt(LocalDateTime.now());
                        eventRepository.save(event);
                        return true;
                    }
                    return false;
                })
                .orElse(false);
    }
}