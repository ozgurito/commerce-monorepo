package com.commerce.monorepo.repository;

import com.commerce.monorepo.entity.UserAddress;
import com.commerce.monorepo.entity.UserAddress.AddressType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);

    List<UserAddress> findByUserIdAndAddressType(Long userId, AddressType addressType);

    Optional<UserAddress> findByIdAndUserId(Long id, Long userId);

    Optional<UserAddress> findByUserIdAndIsDefaultTrue(Long userId);

    Optional<UserAddress> findByUserIdAndAddressTypeAndIsDefaultTrue(Long userId, AddressType addressType);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE UserAddress a SET a.isDefault = false WHERE a.user.id = :userId")
    void clearDefaultAddresses(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE UserAddress a SET a.isDefault = false WHERE a.user.id = :userId AND a.addressType = :type")
    void clearDefaultAddressesByType(@Param("userId") Long userId, @Param("type") AddressType type);

    Long countByUserId(Long userId);
}

