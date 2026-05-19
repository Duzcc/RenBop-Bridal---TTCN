package com.renbobridal.module.auth.service;

import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import com.renbobridal.module.auth.dto.CustomerMeasurementDto;
import com.renbobridal.module.auth.dto.CustomerMeasurementRequest;
import com.renbobridal.module.auth.entity.CustomerMeasurement;
import com.renbobridal.module.auth.entity.User;
import com.renbobridal.module.auth.repository.CustomerMeasurementRepository;
import com.renbobridal.module.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerMeasurementService {

    private final CustomerMeasurementRepository measurementRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CustomerMeasurementDto> getMeasurementsByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        return measurementRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerMeasurementDto getMeasurementById(Long id) {
        return mapToDto(measurementRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST)));
    }

    @Transactional
    public CustomerMeasurementDto addMeasurement(Long userId, CustomerMeasurementRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        CustomerMeasurement.Gender gender = CustomerMeasurement.Gender.FEMALE;
        if ("MALE".equalsIgnoreCase(request.getGender())) {
            gender = CustomerMeasurement.Gender.MALE;
        }

        CustomerMeasurement measurement = CustomerMeasurement.builder()
                .user(user)
                .label(request.getLabel())
                .gender(gender)
                .bust(request.getBust())
                .waist(request.getWaist())
                .hip(request.getHip())
                .shoulder(request.getShoulder())
                .armLength(request.getArmLength())
                .note(request.getNote())
                .build();

        return mapToDto(measurementRepository.save(measurement));
    }

    @Transactional
    public CustomerMeasurementDto updateMeasurement(Long id, CustomerMeasurementRequest request) {
        CustomerMeasurement measurement = measurementRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST));

        measurement.setLabel(request.getLabel());
        if (request.getGender() != null) {
            measurement.setGender("MALE".equalsIgnoreCase(request.getGender())
                    ? CustomerMeasurement.Gender.MALE
                    : CustomerMeasurement.Gender.FEMALE);
        }
        measurement.setBust(request.getBust());
        measurement.setWaist(request.getWaist());
        measurement.setHip(request.getHip());
        measurement.setShoulder(request.getShoulder());
        measurement.setArmLength(request.getArmLength());
        measurement.setNote(request.getNote());

        return mapToDto(measurementRepository.save(measurement));
    }

    @Transactional
    public void deleteMeasurement(Long id) {
        CustomerMeasurement measurement = measurementRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST));
        measurementRepository.delete(measurement);
    }

    private CustomerMeasurementDto mapToDto(CustomerMeasurement entity) {
        return CustomerMeasurementDto.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .fullName(entity.getUser().getFullName())
                .label(entity.getLabel())
                .gender(entity.getGender() != null ? entity.getGender().name() : "FEMALE")
                .bust(entity.getBust())
                .waist(entity.getWaist())
                .hip(entity.getHip())
                .shoulder(entity.getShoulder())
                .armLength(entity.getArmLength())
                .note(entity.getNote())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
