package com.swaranidhi.service;

import com.swaranidhi.entity.*;
import com.swaranidhi.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(BusinessRepository businessRepository,
                           UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           CustomerRepository customerRepository,
                           SupplierRepository supplierRepository,
                           SaleRepository saleRepository,
                           PurchaseRepository purchaseRepository,
                           InventoryTransactionRepository inventoryTransactionRepository,
                           PasswordEncoder passwordEncoder) {
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.supplierRepository = supplierRepository;
        this.saleRepository = saleRepository;
        this.purchaseRepository = purchaseRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already initialized. Skipping seed.");
            return;
        }

        logger.info("Seeding initial demo Kirana store data for Swaranidhi...");

        // 1. Business
        Business business = new Business(
                "Swaranidhi Kirana & General Store",
                "Ramesh Kumar",
                "9876543210",
                "owner@kirana.com",
                "Vijayawada",
                "Andhra Pradesh"
        );
        business.setAddress("Shop #14, Main Bazaar Road, Governorpet");
        business.setPincode("520002");
        business.setGstin("37AAAAA0000A1Z5");
        business = businessRepository.save(business);

        // 2. Owner User
        User owner = new User(
                business,
                "owner@kirana.com",
                passwordEncoder.encode("password123"),
                "Ramesh Kumar",
                "9876543210",
                Role.OWNER
        );
        userRepository.save(owner);

        // 3. Categories
        String[] categories = {"Groceries", "Spices", "Snacks", "Dairy", "Beverages", "Personal Care"};
        for (String catName : categories) {
            categoryRepository.save(new Category(business, catName, "Household " + catName));
        }

        // 4. Products
        Product p1 = new Product(business, "Maggi 2-Minute Noodles (70g)", "Snacks", "MAGGI-70G", 45, "packets", 20,
                new BigDecimal("14.00"), new BigDecimal("15.00"), "Sri Balaji Traders");
        Product p2 = new Product(business, "Aashirvaad Shudh Chakki Atta (5kg)", "Groceries", "ATTA-5KG", 18, "packets", 10,
                new BigDecimal("220.00"), new BigDecimal("245.00"), "Krishna Agro");
        Product p3 = new Product(business, "Tata Salt Vacuum Evaporated (1kg)", "Groceries", "SALT-1KG", 30, "packets", 15,
                new BigDecimal("24.00"), new BigDecimal("28.00"), "Sri Balaji Traders");
        Product p4 = new Product(business, "Fortune Sunlite Sunflower Oil (1L)", "Groceries", "OIL-1L", 22, "packets", 10,
                new BigDecimal("125.00"), new BigDecimal("140.00"), "Krishna Agro");
        Product p5 = new Product(business, "Toor Dal Premium (1kg)", "Groceries", "TOOR-1KG", 6, "kg", 15, // LOW STOCK
                new BigDecimal("145.00"), new BigDecimal("165.00"), "Krishna Agro");
        Product p6 = new Product(business, "Amul Taaza Toned Milk (500ml)", "Dairy", "MILK-500ML", 25, "packets", 10,
                new BigDecimal("26.00"), new BigDecimal("27.00"), "Amul Direct");
        Product p7 = new Product(business, "India Gate Basmati Rice (5kg)", "Groceries", "RICE-5KG", 14, "packets", 8,
                new BigDecimal("480.00"), new BigDecimal("530.00"), "Krishna Agro");
        Product p8 = new Product(business, "Everest Turmeric Powder (100g)", "Spices", "HALDI-100G", 35, "packets", 10,
                new BigDecimal("32.00"), new BigDecimal("38.00"), "Sri Balaji Traders");
        Product p9 = new Product(business, "Parle-G Gold Biscuits (1kg)", "Snacks", "PARLE-1KG", 0, "packets", 10, // OUT OF STOCK
                new BigDecimal("85.00"), new BigDecimal("100.00"), "Sri Balaji Traders");
        Product p10 = new Product(business, "Tata Tea Gold (250g)", "Beverages", "TEA-250G", 16, "packets", 10,
                new BigDecimal("130.00"), new BigDecimal("150.00"), "Tata Consumer");

        List<Product> products = productRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10));

        // Initial inventory transactions
        for (Product prod : products) {
            if (prod.getQuantity() > 0) {
                inventoryTransactionRepository.save(new InventoryTransaction(
                        business, prod, TransactionType.STOCK_IN, prod.getQuantity(), 0, prod.getQuantity(),
                        "SEED-INIT", "Initial stock entry", "Ramesh Kumar"
                ));
            }
        }

        // 5. Customers
        Customer c1 = new Customer(business, "Ramesh Naidu", "9123456780", "ramesh@example.com", "Gandhi Road", new BigDecimal("850.00"));
        c1.setCurrentBalance(new BigDecimal("850.00"));
        c1.setTotalPurchases(new BigDecimal("3450.00"));

        Customer c2 = new Customer(business, "Lakshmi Devi", "9848012345", "lakshmi@example.com", "Temple Street", new BigDecimal("420.00"));
        c2.setCurrentBalance(new BigDecimal("420.00"));
        c2.setTotalPurchases(new BigDecimal("1850.00"));

        Customer c3 = new Customer(business, "Suresh Kumar", "9988776655", "suresh@example.com", "Station Road", new BigDecimal("150.00"));
        c3.setCurrentBalance(new BigDecimal("150.00"));
        c3.setTotalPurchases(new BigDecimal("980.00"));

        Customer c4 = new Customer(business, "Anitha Sharma", "9765432109", "anitha@example.com", "Ring Road", BigDecimal.ZERO);
        c4.setCurrentBalance(BigDecimal.ZERO);
        c4.setTotalPurchases(new BigDecimal("2100.00"));

        customerRepository.saveAll(List.of(c1, c2, c3, c4));

        // 6. Suppliers
        Supplier s1 = new Supplier(business, "Sri Balaji Wholesale Traders", "9440123456", "balaji@suppliers.com",
                "Kaleswara Rao Market", "37ABCDE1234F1Z5", new BigDecimal("4500.00"));
        s1.setOutstandingBalance(new BigDecimal("4500.00"));
        s1.setTotalPurchases(new BigDecimal("24000.00"));

        Supplier s2 = new Supplier(business, "Krishna Agro Distributors", "9849112233", "krishna@agro.com",
                "Autonagar Industrial Area", "37FGHIJ5678K1Z2", new BigDecimal("2200.00"));
        s2.setOutstandingBalance(new BigDecimal("2200.00"));
        s2.setTotalPurchases(new BigDecimal("18500.00"));

        supplierRepository.saveAll(List.of(s1, s2));

        // 7. Seed Sample Today's Sale
        Sale sale1 = new Sale(business, "INV-260919-0001", c1, c1.getName(),
                new BigDecimal("530.00"), BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("530.00"),
                PaymentMethod.UPI, new BigDecimal("530.00"), BigDecimal.ZERO, "INIT-SALE-1", "Ramesh Kumar");
        sale1.addItem(new SaleItem(p7, p7.getName(), 1, p7.getUnit(), p7.getSellingPrice()));
        saleRepository.save(sale1);

        Sale sale2 = new Sale(business, "INV-260919-0002", c2, c2.getName(),
                new BigDecimal("165.00"), BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("165.00"),
                PaymentMethod.CREDIT, BigDecimal.ZERO, new BigDecimal("165.00"), "INIT-SALE-2", "Ramesh Kumar");
        sale2.addItem(new SaleItem(p5, p5.getName(), 1, p5.getUnit(), p5.getSellingPrice()));
        saleRepository.save(sale2);

        logger.info("Demo Kirana store seeded successfully! Login: owner@kirana.com / password123");
    }
}
