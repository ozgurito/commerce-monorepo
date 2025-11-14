package com.commerce.monorepo.service;

import com.commerce.monorepo.dto.CreditTransactionDto;
import com.commerce.monorepo.dto.DesignCreditDto;
import com.commerce.monorepo.entity.CreditTransaction;
import com.commerce.monorepo.entity.DesignCredit;
import com.commerce.monorepo.entity.User;
import com.commerce.monorepo.exception.BaseException;
import com.commerce.monorepo.exception.ErrorCode;
import com.commerce.monorepo.repository.CreditTransactionRepository;
import com.commerce.monorepo.repository.DesignCreditRepository;
import com.commerce.monorepo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DesignCreditService {

    private final DesignCreditRepository designCreditRepository;
    private final CreditTransactionRepository creditTransactionRepository;
    private final UserRepository userRepository;

    public DesignCreditService(DesignCreditRepository designCreditRepository,
                               CreditTransactionRepository creditTransactionRepository,
                               UserRepository userRepository) {
        this.designCreditRepository = designCreditRepository;
        this.creditTransactionRepository = creditTransactionRepository;
        this.userRepository = userRepository;
    }

    public DesignCreditDto getUserCredits(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        DesignCredit credits = designCreditRepository.findByUserId(user.getId())
                .orElseGet(() -> createInitialCredits(user.getId()));

        return mapToDto(credits);
    }

    public DesignCreditDto addCredits(String userEmail, Integer amount, String type, String description) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        DesignCredit credits = designCreditRepository.findByUserId(user.getId())
                .orElseGet(() -> createInitialCredits(user.getId()));

        credits.setCurrentBalance(credits.getCurrentBalance() + amount);
        credits.setTotalEarned(credits.getTotalEarned() + amount);

        DesignCredit updated = designCreditRepository.save(credits);

        createTransaction(user.getId(), amount, type, description, updated.getCurrentBalance());

        return mapToDto(updated);
    }

    public DesignCreditDto useCredits(String userEmail, Integer amount, String description) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        DesignCredit credits = designCreditRepository.findByUserId(user.getId())
                .orElseGet(() -> createInitialCredits(user.getId()));

        if (credits.getCurrentBalance() < amount) {
            throw new BaseException(ErrorCode.INSUFFICIENT_CREDITS);
        }

        credits.setCurrentBalance(credits.getCurrentBalance() - amount);
        credits.setTotalUsed(credits.getTotalUsed() + amount);

        DesignCredit updated = designCreditRepository.save(credits);

        createTransaction(user.getId(), -amount, "use", description, updated.getCurrentBalance());

        return mapToDto(updated);
    }

    @Transactional(readOnly = true)
    public List<CreditTransactionDto> getUserTransactions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        return creditTransactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapTransactionToDto)
                .toList();
    }

    private DesignCredit createInitialCredits(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        DesignCredit credits = new DesignCredit();
        credits.setUser(user);
        credits.setCurrentBalance(0);
        credits.setTotalEarned(0);
        credits.setTotalUsed(0);
        credits.setTotalExpired(0);
        credits.setMembershipTier("free");
        credits.setTierDiscountPercentage(java.math.BigDecimal.ZERO);

        return designCreditRepository.save(credits);
    }

    private void createTransaction(Long userId, Integer amount, String type, String description, Integer balanceAfter) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        CreditTransaction transaction = new CreditTransaction();
        transaction.setUser(user);
        transaction.setAmount(amount);
        transaction.setType(type);
        transaction.setDescription(description);
        transaction.setBalanceAfter(balanceAfter);

        creditTransactionRepository.save(transaction);
    }

    private DesignCreditDto mapToDto(DesignCredit credits) {
        return new DesignCreditDto(
                credits.getId(),
                credits.getUser().getId(),
                credits.getCurrentBalance(),
                credits.getTotalEarned(),
                credits.getTotalUsed(),
                credits.getMembershipTier(),
                credits.getTierDiscountPercentage()
        );
    }

    private CreditTransactionDto mapTransactionToDto(CreditTransaction transaction) {
        return new CreditTransactionDto(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getType(),
                transaction.getDescription(),
                transaction.getBalanceAfter(),
                transaction.getCreatedAt()
        );
    }
}
