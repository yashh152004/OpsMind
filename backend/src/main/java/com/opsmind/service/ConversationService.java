package com.opsmind.service;

import com.opsmind.model.ChatMessage;
import com.opsmind.model.Conversation;
import com.opsmind.model.User;
import com.opsmind.repository.ChatMessageRepository;
import com.opsmind.repository.ConversationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    public ConversationService(ConversationRepository conversationRepository,
                               ChatMessageRepository chatMessageRepository) {
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    public List<Conversation> getUserConversations(User user) {
        return conversationRepository.findByUserAndArchivedFalseOrderByUpdatedAtDesc(user);
    }

    public Optional<Conversation> getConversation(Long id) {
        return conversationRepository.findById(id);
    }

    @Transactional
    public Conversation createConversation(User user, String title) {
        Conversation conversation = Conversation.builder()
                .user(user)
                .title(title)
                .pinned(false)
                .archived(false)
                .build();
        return conversationRepository.save(conversation);
    }

    @Transactional
    public void saveMessage(Conversation conversation, String role, String content) {
        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .role(role)
                .content(content)
                .build();
        chatMessageRepository.save(message);
        
        // Update conversation timestamp
        conversation.setUpdatedAt(java.time.LocalDateTime.now());
        conversationRepository.save(conversation);
    }

    @Transactional
    public void deleteConversation(Long id) {
        conversationRepository.deleteById(id);
    }

    @Transactional
    public void togglePin(Long id) {
        conversationRepository.findById(id).ifPresent(c -> {
            c.setPinned(!c.isPinned());
            conversationRepository.save(c);
        });
    }

    @Transactional
    public void archiveConversation(Long id) {
        conversationRepository.findById(id).ifPresent(c -> {
            c.setArchived(true);
            conversationRepository.save(c);
        });
    }

    @Transactional
    public void renameConversation(Long id, String newTitle) {
        conversationRepository.findById(id).ifPresent(c -> {
            c.setTitle(newTitle);
            conversationRepository.save(c);
        });
    }
}
