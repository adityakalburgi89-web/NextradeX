package com.nextradex.modules.trading.options;

import com.nextradex.modules.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OptionsContractRepository extends JpaRepository<OptionsContract, Long> {
    List<OptionsContract> findAllByUser(User user);
    List<OptionsContract> findAllByUserAndStatus(User user, OptionStatus status);
    List<OptionsContract> findAllByUserAndSymbol(User user, String symbol);
    Optional<OptionsContract> findByIdAndUser(Long contractId, User user);
}
