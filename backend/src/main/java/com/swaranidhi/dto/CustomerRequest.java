package com.swaranidhi.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class CustomerRequest {

    @NotBlank(message = "Customer name is required")
    private String name;

    @NotBlank(message = "Customer phone number is required")
    private String phone;

    private String email;
    private String address;
    private BigDecimal openingBalance = BigDecimal.ZERO;

    public CustomerRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public BigDecimal getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; }
}
