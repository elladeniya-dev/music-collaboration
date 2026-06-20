package com.harmonix.repository;

import com.harmonix.entity.RoomMessage;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomMessageRepository extends MongoRepository<RoomMessage, String> {
    List<RoomMessage> findByRoomId(String roomId, Sort sort);
}
