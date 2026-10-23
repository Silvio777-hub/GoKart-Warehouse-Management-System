package com.swam.service;

import com.swam.model.PasswordResetToken;
import com.swam.model.User;
import com.swam.repository.PasswordResetTokenRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {
    private final UserService userService;
    private final PasswordResetTokenRepository tokenRepo;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(UserService userService,
            PasswordResetTokenRepository tokenRepo,
            EmailService emailService,
            PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.tokenRepo = tokenRepo;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void createTokenAndSendEmail(String email) {
        User user = userService.findByEmail(email);
        if (user == null)
            return;

        // Clear existing tokens
        tokenRepo.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        tokenRepo.save(new PasswordResetToken(token, user));

        emailService.sendPasswordResetLink(user.getEmail(), token);
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> resetToken = tokenRepo.findByToken(token);

        if (resetToken.isPresent() && !resetToken.get().isExpired()) {
            User user = resetToken.get().getUser();
            user.setPassword(passwordEncoder.encode(newPassword));
            userService.save(user);
            tokenRepo.deleteByUser(user);
            return true;
        }
        return false;
    }
}
