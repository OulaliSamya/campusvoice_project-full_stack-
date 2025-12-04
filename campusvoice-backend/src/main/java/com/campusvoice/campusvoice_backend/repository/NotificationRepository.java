package com.campusvoice.campusvoice_backend.repository;

import com.campusvoice.campusvoice_backend.model.Notification;
import com.campusvoice.campusvoice_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserAndReadFalse(User user);
}
