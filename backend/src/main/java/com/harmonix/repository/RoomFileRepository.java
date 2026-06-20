package com.harmonix.repository;

import com.harmonix.entity.RoomFile;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomFileRepository extends MongoRepository<RoomFile, String> {
    List<RoomFile> findByRoomId(String roomId, Sort sort);
}
