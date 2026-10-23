package com.swam.service;

import com.swam.model.User;
import com.swam.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository repo;

    @InjectMocks
    private UserService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @SuppressWarnings("null")
    void testSaveUser() {
        User user = new User();
        user.setUsername("testuser");
        when(repo.save(any(User.class))).thenReturn(user);

        User saved = service.save(user);
        assertNotNull(saved);
        assertEquals("testuser", saved.getUsername());
        verify(repo, times(1)).save(user);
    }

    @Test
    void testFindUser() {
        User user = new User();
        user.setId(1L);
        when(repo.findById(1L)).thenReturn(Optional.of(user));

        Optional<User> found = service.find(1L);
        assertTrue(found.isPresent());
        assertEquals(1L, found.get().getId());
    }

    @Test
    @SuppressWarnings("null")
    void testDeleteUserSoft() {
        User user = new User();
        user.setId(1L);
        user.setDeleted(false);
        when(repo.findById(1L)).thenReturn(Optional.of(user));
        when(repo.save(any(User.class))).thenReturn(user);

        service.delete(1L);
        assertTrue(user.isDeleted());
        verify(repo, times(1)).save(user);
    }

    @Test
    @SuppressWarnings("null")
    void testRestoreUser() {
        User user = new User();
        user.setId(1L);
        user.setDeleted(true);
        when(repo.findById(1L)).thenReturn(Optional.of(user));
        when(repo.save(any(User.class))).thenReturn(user);

        service.restore(1L);
        assertFalse(user.isDeleted());
        verify(repo, times(1)).save(user);
    }

    @Test
    @SuppressWarnings("null")
    void testFindWithNullId() {
        Optional<User> result = service.find(null);
        assertFalse(result.isPresent());
        verify(repo, never()).findById(anyLong());
    }

    @Test
    @SuppressWarnings("null")
    void testSaveWithNullUser() {
        assertThrows(IllegalArgumentException.class, () -> service.save(null));
        verify(repo, never()).save(any(User.class));
    }

    @Test
    @SuppressWarnings("null")
    void testDeleteWithNullId() {
        service.delete(null);
        verify(repo, never()).findById(anyLong());
    }

    @Test
    @SuppressWarnings("null")
    void testRestoreWithNullId() {
        service.restore(null);
        verify(repo, never()).findById(anyLong());
    }
}
