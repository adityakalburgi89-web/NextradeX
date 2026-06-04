package com.NexTradeX.order;

import com.NexTradeX.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DcaScheduleRepository extends JpaRepository<DcaSchedule, Long> {
    List<DcaSchedule> findAllByUser(User user);
    List<DcaSchedule> findByActiveTrueAndNextRunTimeBefore(LocalDateTime time);
}
