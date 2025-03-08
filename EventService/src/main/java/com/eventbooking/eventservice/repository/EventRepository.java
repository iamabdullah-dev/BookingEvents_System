package com.eventbooking.eventservice.repository;

import com.eventbooking.eventservice.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByCategory(String category);
}