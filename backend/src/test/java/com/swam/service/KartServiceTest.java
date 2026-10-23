package com.swam.service;

import com.swam.model.Kart;
import com.swam.repository.KartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class KartServiceTest {

    @Mock
    private KartRepository repo;

    @InjectMocks
    private KartService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @SuppressWarnings("null")
    void testListKartsWithPagination() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Kart> page = new PageImpl<>(Collections.emptyList());
        when(repo.findAll(pageable)).thenReturn(page);

        Page<Kart> result = service.list(pageable, null);
        assertNotNull(result);
        verify(repo, times(1)).findAll(pageable);
    }

    @Test
    @SuppressWarnings("null")
    void testSearchKarts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Kart> page = new PageImpl<>(Collections.emptyList());
        when(repo.searchKarts(eq("K-01"), any(Pageable.class))).thenReturn(page);

        Page<Kart> result = service.list(pageable, "K-01");
        assertNotNull(result);
        verify(repo, times(1)).searchKarts(eq("K-01"), any(Pageable.class));
    }

    @Test
    @SuppressWarnings("null")
    void testResetHours() {
        Kart kart = new Kart();
        kart.setId(1L);
        kart.setHoursRun(50);
        when(repo.findById(1L)).thenReturn(Optional.of(kart));
        when(repo.save(any(Kart.class))).thenReturn(kart);

        kart.setHoursRun(0);
        service.save(kart);

        assertEquals(0, kart.getHoursRun());
        verify(repo, times(1)).save(kart);
    }

    @Test
    @SuppressWarnings("null")
    void testFindWithNullId() {
        Optional<Kart> result = service.find(null);
        assertFalse(result.isPresent());
        verify(repo, never()).findById(anyLong());
    }

    @Test
    @SuppressWarnings("null")
    void testSaveWithNullKart() {
        assertThrows(IllegalArgumentException.class, () -> service.save(null));
        verify(repo, never()).save(any(Kart.class));
    }

    @Test
    void testDeleteWithNullId() {
        service.delete(null);
        verify(repo, never()).deleteById(anyLong());
    }

    @Test
    @SuppressWarnings("null")
    void testListWithNullPageable() {
        Page<Kart> result = service.list(null, null);
        assertTrue(result.isEmpty());
        verify(repo, never()).findAll(any(Pageable.class));
    }
}
