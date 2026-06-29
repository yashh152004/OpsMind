package com.opsmind.repository;

import com.opsmind.model.Conversation;
import com.opsmind.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByUserOrderByUpdatedAtDesc(User user);
    List<Conversation> findByUserAndArchivedFalseOrderByUpdatedAtDesc(User user);
    List<Conversation> findByUserAndArchivedTrueOrderByUpdatedAtDesc(User user);
}
