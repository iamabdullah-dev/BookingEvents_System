package com.eventbooking.eventservice.controller;

import com.eventbooking.eventservice.model.Event;
import com.eventbooking.eventservice.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService eventService;
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable String id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@Valid @RequestBody Map<String, Object> eventData) {
        try {
            // Validate required fields
            String[] requiredFields = { "title", "description", "date", "location", "price", "availableTickets" };
            Map<String, String> missingFields = new HashMap<>();

            for (String field : requiredFields) {
                if (eventData.get(field) == null ||
                        (eventData.get(field) instanceof String && ((String) eventData.get(field)).trim().isEmpty())) {
                    missingFields.put(field, field + " is required");
                }
            }

            if (!missingFields.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Validation failed");
                errorResponse.put("errors", missingFields);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            Event event = new Event();
            event.setTitle((String) eventData.get("title"));
            event.setDescription((String) eventData.get("description"));

            // Parse date string to Date object
            String dateStr = (String) eventData.get("date");
            try {
                Date date = dateFormat.parse(dateStr);
                event.setDate(date);
            } catch (ParseException e) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid date format. Use yyyy-MM-dd'T'HH:mm:ss");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            event.setLocation((String) eventData.get("location"));

            // Convert and validate price
            try {
                Object priceObj = eventData.get("price");
                Double price;
                if (priceObj instanceof Number) {
                    price = ((Number) priceObj).doubleValue();
                } else {
                    price = Double.parseDouble(priceObj.toString());
                }

                if (price <= 0) {
                    Map<String, String> errorResponse = new HashMap<>();
                    errorResponse.put("message", "Price must be positive");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
                }

                event.setPrice(price);
            } catch (NumberFormatException e) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid price format");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // Convert and validate availableTickets
            try {
                Object ticketsObj = eventData.get("availableTickets");
                Integer tickets;
                if (ticketsObj instanceof Number) {
                    tickets = ((Number) ticketsObj).intValue();
                } else {
                    tickets = Integer.parseInt(ticketsObj.toString());
                }

                if (tickets < 0) {
                    Map<String, String> errorResponse = new HashMap<>();
                    errorResponse.put("message", "Available tickets cannot be negative");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
                }

                event.setAvailableTickets(tickets);
            } catch (NumberFormatException e) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid availableTickets format");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            event.setImageUrl((String) eventData.get("imageUrl"));
            event.setCategory((String) eventData.get("category"));

            Event savedEvent = eventService.createEvent(event);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable String id, @Valid @RequestBody Event event) {
        return eventService.updateEvent(id, event)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        if (eventService.deleteEvent(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Boolean>> checkAvailability(
            @PathVariable String id,
            @RequestParam int tickets) {
        boolean isAvailable = eventService.checkAvailability(id, tickets);
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", isAvailable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/book")
    public ResponseEntity<Map<String, Boolean>> bookTickets(
            @PathVariable String id,
            @RequestParam int tickets) {
        boolean success = eventService.updateTicketAvailability(id, tickets);
        Map<String, Boolean> response = new HashMap<>();
        response.put("success", success);

        if (success) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
}