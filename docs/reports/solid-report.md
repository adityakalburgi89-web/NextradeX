# SOLID Principle Scorecard & Architectural Report
**Target Path:** `C:\Users\adity\OneDrive\Desktop\NexTradeX`  
**Total Files Analyzed:** `180`  
**Overall Codebase Score:** **4.8 / 10.0** (Grade: D/F — High Risk Monolithic Technical Debt)

## Executive Summary & Scorecard
| Principle | Rating | Status | Primary Finding |
| :--- | :---: | :---: | :--- |
| **SRP - Single Responsibility** | **4.6 / 10** | Fail | 7 service/controller classes carry multiple responsibilities or exceed size limits. |
| **OCP - Open-Closed** | **1.0 / 10** | Fail | 19 switch statements or if/else chains block seamless extension. |
| **LSP - Liskov Substitution** | **10.0 / 10** | Pass | Subtypes and exception hierarchies adhere to parent contracts cleanly. |
| **ISP - Interface Segregation** | **1.0 / 10** | Fail | 12 concrete service classes expose fat interfaces forcing consumers to depend on unneeded methods. |
| **DIP - Dependency Inversion** | **7.6 / 10** | Warning | 3 dependencies bind directly to concrete implementation classes instead of interfaces. |

## SOLID Principles Analysis Breakdown
### Single Responsibility Principle (SRP) — **4.6 / 10** (Fail)
- **Strengths:** Base module architecture established.
- **Weaknesses:** 7 violation(s) detected. Main issues: Class 'WalletService' exposes 13 public methods, exceeding maximum threshold of 10.; Class 'UserService' exposes 14 public methods, exceeding maximum threshold of 10..

### Open-Closed Principle (OCP) — **1.0 / 10** (Fail)
- **Strengths:** Base module architecture established.
- **Weaknesses:** 19 violation(s) detected. Main issues: Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism.; Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code..

### Liskov Substitution Principle (LSP) — **10.0 / 10** (Pass)
- **Strengths:** 100% contract compliance across all analyzed components.
- **Weaknesses:** None detected.

### Interface Segregation Principle (ISP) — **1.0 / 10** (Fail)
- **Strengths:** Base module architecture established.
- **Weaknesses:** 12 violation(s) detected. Main issues: Concrete service class 'WalletService' exposes 13 public methods without implementing any interface abstraction.; Concrete service class 'WalletController' exposes 6 public methods without implementing any interface abstraction..

### Dependency Inversion Principle (DIP) — **7.6 / 10** (Warning)
- **Strengths:** Base module architecture established.
- **Weaknesses:** 3 violation(s) detected. Main issues: Dependency 'redisTemplate' of type 'StringRedisTemplate' in class 'RedisRateLimiter' is bound directly to a concrete implementation class.; Dependency 'redisRateLimiter' of type 'RedisRateLimiter' in class 'RateLimitInterceptor' is bound directly to a concrete implementation class..

## Projected SOLID Score Comparison (Before vs. After Refactoring)
| Principle | Current Score | Projected Score | Architectural Impact After Improvement |
| :--- | :---: | :---: | :--- |
| **SRP** | 4.6 / 10 | **9.5 / 10** | Services stripped to orchestrators; validation, execution, and scheduling isolated in dedicated single-purpose classes. |
| **OCP** | 1.0 / 10 | **9.5 / 10** | Strategy & Factory patterns allow adding new business types without editing existing code. |
| **LSP** | 10.0 / 10 | **9.5 / 10** | Subtypes extend base interfaces seamlessly with 100% contract compliance. |
| **ISP** | 1.0 / 10 | **9.5 / 10** | Fat services split into client-specific interfaces (Readers, Executors, Mutators). |
| **DIP** | 7.6 / 10 | **9.5 / 10** | Controllers and Services bind exclusively to interface abstractions instead of concrete classes. |
| **OVERALL SCORE** | **4.8 / 10** | **9.5 / 10** | Transformed into a clean, decoupled, enterprise-ready micro-architecture. |

## Detailed Violation List
### SRP Violations (7)
| Severity | Location | Class / Context | Description | Actionable Fix |
| :---: | :--- | :--- | :--- | :--- |
| Medium | [..\NexTradeX\src\main\java\com\NexTradeX\wallet\WalletService.java#L14](file:///../NexTradeX/src/main/java/com/NexTradeX/wallet/WalletService.java#L14) | `WalletService` | Class 'WalletService' exposes 13 public methods, exceeding maximum threshold of 10. | Split public interface of 'WalletService' into targeted interfaces or distinct component classes. |
| Medium | [..\NexTradeX\src\main\java\com\NexTradeX\user\UserService.java#L13](file:///../NexTradeX/src/main/java/com/NexTradeX/user/UserService.java#L13) | `UserService` | Class 'UserService' exposes 14 public methods, exceeding maximum threshold of 10. | Split public interface of 'UserService' into targeted interfaces or distinct component classes. |
| Critical | [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L28](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L28) | `MarketService` | Class 'MarketService' has 646 lines of code, exceeding threshold of 250. | Decompose 'MarketService' into smaller, focused classes or separate concerns into auxiliary services. |
| Medium | [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L28](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L28) | `MarketService` | Class 'MarketService' exposes 11 public methods, exceeding maximum threshold of 10. | Split public interface of 'MarketService' into targeted interfaces or distinct component classes. |
| Critical | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L21](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L21) | `BinanceService` | Class 'BinanceService' has 463 lines of code, exceeding threshold of 250. | Decompose 'BinanceService' into smaller, focused classes or separate concerns into auxiliary services. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L21](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L21) | `BinanceService` | Class 'BinanceService' exposes 17 public methods, exceeding maximum threshold of 10. | Split public interface of 'BinanceService' into targeted interfaces or distinct component classes. |
| Medium | [..\NexTradeX\src\main\java\com\NexTradeX\auth\JwtService.java#L22](file:///../NexTradeX/src/main/java/com/NexTradeX/auth/JwtService.java#L22) | `JwtService` | Class 'JwtService' exposes 13 public methods, exceeding maximum threshold of 10. | Split public interface of 'JwtService' into targeted interfaces or distinct component classes. |

### OCP Violations (19)
| Severity | Location | Class / Context | Description | Actionable Fix |
| :---: | :--- | :--- | :--- | :--- |
| High | [..\NexTradeX\frontend\src\pages\AuthPage.jsx#L272](file:///../NexTradeX/frontend/src/pages/AuthPage.jsx#L272) | - | Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism. | Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle). |
| Medium | [..\NexTradeX\src\main\java\com\NexTradeX\order\OrderMatchingScheduler.java#L35](file:///../NexTradeX/src/main/java/com/NexTradeX/order/OrderMatchingScheduler.java#L35) | - | Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code. | Refactor conditional chain into polymorphic dispatch or Factory pattern. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L272](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L272) | - | Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism. | Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle). |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L423](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L423) | - | Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism. | Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle). |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L540](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L540) | - | Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism. | Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle). |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L583](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L583) | - | Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism. | Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle). |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L602](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L602) | - | Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism. | Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle). |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L656](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L656) | - | Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism. | Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle). |
| Medium | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceWebSocketService.java#L79](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceWebSocketService.java#L79) | - | Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code. | Refactor conditional chain into polymorphic dispatch or Factory pattern. |
| Medium | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L56](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L56) | - | Cascading if-else chain (4 branches) inspecting type flags. Modifying behavior requires editing existing code. | Refactor conditional chain into polymorphic dispatch or Factory pattern. |
| Medium | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L71](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L71) | - | Cascading if-else chain (4 branches) inspecting type flags. Modifying behavior requires editing existing code. | Refactor conditional chain into polymorphic dispatch or Factory pattern. |
| Medium | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L94](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L94) | - | Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code. | Refactor conditional chain into polymorphic dispatch or Factory pattern. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L95](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L95) | - | Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism. | Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle). |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L108](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L108) | - | Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism. | Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle). |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L121](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L121) | - | Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism. | Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle). |
| Medium | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L154](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L154) | - | Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code. | Refactor conditional chain into polymorphic dispatch or Factory pattern. |
| Medium | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L169](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L169) | - | Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code. | Refactor conditional chain into polymorphic dispatch or Factory pattern. |
| Medium | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L453](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L453) | - | Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code. | Refactor conditional chain into polymorphic dispatch or Factory pattern. |
| Medium | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L469](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L469) | - | Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code. | Refactor conditional chain into polymorphic dispatch or Factory pattern. |

### LSP Violations (0)
*No violations found for LSP.*

### ISP Violations (12)
| Severity | Location | Class / Context | Description | Actionable Fix |
| :---: | :--- | :--- | :--- | :--- |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\wallet\WalletService.java#L14](file:///../NexTradeX/src/main/java/com/NexTradeX/wallet/WalletService.java#L14) | `WalletService` | Concrete service class 'WalletService' exposes 13 public methods without implementing any interface abstraction. | Extract segregated, role-specific interfaces for 'WalletService' so consumers are not forced to depend on unneeded methods. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\wallet\WalletController.java#L19](file:///../NexTradeX/src/main/java/com/NexTradeX/wallet/WalletController.java#L19) | `WalletController` | Concrete service class 'WalletController' exposes 6 public methods without implementing any interface abstraction. | Extract segregated, role-specific interfaces for 'WalletController' so consumers are not forced to depend on unneeded methods. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\order\OrderService.java#L19](file:///../NexTradeX/src/main/java/com/NexTradeX/order/OrderService.java#L19) | `OrderService` | Concrete service class 'OrderService' exposes 7 public methods without implementing any interface abstraction. | Extract segregated, role-specific interfaces for 'OrderService' so consumers are not forced to depend on unneeded methods. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\user\UserService.java#L13](file:///../NexTradeX/src/main/java/com/NexTradeX/user/UserService.java#L13) | `UserService` | Concrete service class 'UserService' exposes 14 public methods without implementing any interface abstraction. | Extract segregated, role-specific interfaces for 'UserService' so consumers are not forced to depend on unneeded methods. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L28](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L28) | `MarketService` | Concrete service class 'MarketService' exposes 11 public methods without implementing any interface abstraction. | Extract segregated, role-specific interfaces for 'MarketService' so consumers are not forced to depend on unneeded methods. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketController.java#L22](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketController.java#L22) | `MarketController` | Concrete service class 'MarketController' exposes 7 public methods without implementing any interface abstraction. | Extract segregated, role-specific interfaces for 'MarketController' so consumers are not forced to depend on unneeded methods. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\margin\MarginTradingService.java#L24](file:///../NexTradeX/src/main/java/com/NexTradeX/margin/MarginTradingService.java#L24) | `MarginTradingService` | Concrete service class 'MarginTradingService' exposes 6 public methods without implementing any interface abstraction. | Extract segregated, role-specific interfaces for 'MarginTradingService' so consumers are not forced to depend on unneeded methods. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\futures\FuturesTradingService.java#L24](file:///../NexTradeX/src/main/java/com/NexTradeX/futures/FuturesTradingService.java#L24) | `FuturesTradingService` | Concrete service class 'FuturesTradingService' exposes 8 public methods without implementing any interface abstraction. | Extract segregated, role-specific interfaces for 'FuturesTradingService' so consumers are not forced to depend on unneeded methods. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\exception\GlobalExceptionHandler.java#L14](file:///../NexTradeX/src/main/java/com/NexTradeX/exception/GlobalExceptionHandler.java#L14) | `GlobalExceptionHandler` | Concrete service class 'GlobalExceptionHandler' exposes 9 public methods without implementing any interface abstraction. | Extract segregated, role-specific interfaces for 'GlobalExceptionHandler' so consumers are not forced to depend on unneeded methods. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L21](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L21) | `BinanceService` | Concrete service class 'BinanceService' exposes 17 public methods without implementing any interface abstraction. | Extract segregated, role-specific interfaces for 'BinanceService' so consumers are not forced to depend on unneeded methods. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\auth\JwtService.java#L22](file:///../NexTradeX/src/main/java/com/NexTradeX/auth/JwtService.java#L22) | `JwtService` | Concrete service class 'JwtService' exposes 13 public methods without implementing any interface abstraction. | Extract segregated, role-specific interfaces for 'JwtService' so consumers are not forced to depend on unneeded methods. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\auth\AuthController.java#L17](file:///../NexTradeX/src/main/java/com/NexTradeX/auth/AuthController.java#L17) | `AuthController` | Concrete service class 'AuthController' exposes 6 public methods without implementing any interface abstraction. | Extract segregated, role-specific interfaces for 'AuthController' so consumers are not forced to depend on unneeded methods. |

### DIP Violations (3)
| Severity | Location | Class / Context | Description | Actionable Fix |
| :---: | :--- | :--- | :--- | :--- |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\config\RedisRateLimiter.java#L53](file:///../NexTradeX/src/main/java/com/NexTradeX/config/RedisRateLimiter.java#L53) | `RedisRateLimiter` | Dependency 'redisTemplate' of type 'StringRedisTemplate' in class 'RedisRateLimiter' is bound directly to a concrete implementation class. | Depend on an interface abstraction (e.g. Interface or Base contract) instead of concrete class 'StringRedisTemplate'. |
| High | [..\NexTradeX\src\main\java\com\NexTradeX\config\RateLimitInterceptor.java#L23](file:///../NexTradeX/src/main/java/com/NexTradeX/config/RateLimitInterceptor.java#L23) | `RateLimitInterceptor` | Dependency 'redisRateLimiter' of type 'RedisRateLimiter' in class 'RateLimitInterceptor' is bound directly to a concrete implementation class. | Depend on an interface abstraction (e.g. Interface or Base contract) instead of concrete class 'RedisRateLimiter'. |
| High | [..\NexTradeX\src\test\java\com\NexTradeX\config\RedisRateLimiterTest.java#L12](file:///../NexTradeX/src/test/java/com/NexTradeX/config/RedisRateLimiterTest.java#L12) | `RedisRateLimiterTest` | Dependency 'redisRateLimiter' of type 'RedisRateLimiter' in class 'RedisRateLimiterTest' is bound directly to a concrete implementation class. | Depend on an interface abstraction (e.g. Interface or Base contract) instead of concrete class 'RedisRateLimiter'. |

## Actionable Refactoring Roadmap
Prioritized list of recommended refactorings (highest severity first):

1. **[SRP] Class 'MarketService' has 646 lines of code, exceeding threshold of 250.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L28](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L28)
   - **Severity:** Critical
   - **Recommended Fix:** Decompose 'MarketService' into smaller, focused classes or separate concerns into auxiliary services.

2. **[SRP] Class 'BinanceService' has 463 lines of code, exceeding threshold of 250.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L21](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L21)
   - **Severity:** Critical
   - **Recommended Fix:** Decompose 'BinanceService' into smaller, focused classes or separate concerns into auxiliary services.

3. **[OCP] Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism.**
   - **File:** [..\NexTradeX\frontend\src\pages\AuthPage.jsx#L272](file:///../NexTradeX/frontend/src/pages/AuthPage.jsx#L272)
   - **Severity:** High
   - **Recommended Fix:** Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle).

4. **[ISP] Concrete service class 'WalletService' exposes 13 public methods without implementing any interface abstraction.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\wallet\WalletService.java#L14](file:///../NexTradeX/src/main/java/com/NexTradeX/wallet/WalletService.java#L14)
   - **Severity:** High
   - **Recommended Fix:** Extract segregated, role-specific interfaces for 'WalletService' so consumers are not forced to depend on unneeded methods.

5. **[ISP] Concrete service class 'WalletController' exposes 6 public methods without implementing any interface abstraction.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\wallet\WalletController.java#L19](file:///../NexTradeX/src/main/java/com/NexTradeX/wallet/WalletController.java#L19)
   - **Severity:** High
   - **Recommended Fix:** Extract segregated, role-specific interfaces for 'WalletController' so consumers are not forced to depend on unneeded methods.

6. **[ISP] Concrete service class 'OrderService' exposes 7 public methods without implementing any interface abstraction.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\order\OrderService.java#L19](file:///../NexTradeX/src/main/java/com/NexTradeX/order/OrderService.java#L19)
   - **Severity:** High
   - **Recommended Fix:** Extract segregated, role-specific interfaces for 'OrderService' so consumers are not forced to depend on unneeded methods.

7. **[ISP] Concrete service class 'UserService' exposes 14 public methods without implementing any interface abstraction.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\user\UserService.java#L13](file:///../NexTradeX/src/main/java/com/NexTradeX/user/UserService.java#L13)
   - **Severity:** High
   - **Recommended Fix:** Extract segregated, role-specific interfaces for 'UserService' so consumers are not forced to depend on unneeded methods.

8. **[ISP] Concrete service class 'MarketService' exposes 11 public methods without implementing any interface abstraction.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L28](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L28)
   - **Severity:** High
   - **Recommended Fix:** Extract segregated, role-specific interfaces for 'MarketService' so consumers are not forced to depend on unneeded methods.

9. **[OCP] Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L272](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L272)
   - **Severity:** High
   - **Recommended Fix:** Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle).

10. **[OCP] Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L423](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L423)
   - **Severity:** High
   - **Recommended Fix:** Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle).

11. **[OCP] Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L540](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L540)
   - **Severity:** High
   - **Recommended Fix:** Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle).

12. **[OCP] Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L583](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L583)
   - **Severity:** High
   - **Recommended Fix:** Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle).

13. **[OCP] Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L602](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L602)
   - **Severity:** High
   - **Recommended Fix:** Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle).

14. **[OCP] Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L656](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L656)
   - **Severity:** High
   - **Recommended Fix:** Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle).

15. **[ISP] Concrete service class 'MarketController' exposes 7 public methods without implementing any interface abstraction.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketController.java#L22](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketController.java#L22)
   - **Severity:** High
   - **Recommended Fix:** Extract segregated, role-specific interfaces for 'MarketController' so consumers are not forced to depend on unneeded methods.

16. **[ISP] Concrete service class 'MarginTradingService' exposes 6 public methods without implementing any interface abstraction.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\margin\MarginTradingService.java#L24](file:///../NexTradeX/src/main/java/com/NexTradeX/margin/MarginTradingService.java#L24)
   - **Severity:** High
   - **Recommended Fix:** Extract segregated, role-specific interfaces for 'MarginTradingService' so consumers are not forced to depend on unneeded methods.

17. **[ISP] Concrete service class 'FuturesTradingService' exposes 8 public methods without implementing any interface abstraction.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\futures\FuturesTradingService.java#L24](file:///../NexTradeX/src/main/java/com/NexTradeX/futures/FuturesTradingService.java#L24)
   - **Severity:** High
   - **Recommended Fix:** Extract segregated, role-specific interfaces for 'FuturesTradingService' so consumers are not forced to depend on unneeded methods.

18. **[ISP] Concrete service class 'GlobalExceptionHandler' exposes 9 public methods without implementing any interface abstraction.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\exception\GlobalExceptionHandler.java#L14](file:///../NexTradeX/src/main/java/com/NexTradeX/exception/GlobalExceptionHandler.java#L14)
   - **Severity:** High
   - **Recommended Fix:** Extract segregated, role-specific interfaces for 'GlobalExceptionHandler' so consumers are not forced to depend on unneeded methods.

19. **[DIP] Dependency 'redisTemplate' of type 'StringRedisTemplate' in class 'RedisRateLimiter' is bound directly to a concrete implementation class.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\config\RedisRateLimiter.java#L53](file:///../NexTradeX/src/main/java/com/NexTradeX/config/RedisRateLimiter.java#L53)
   - **Severity:** High
   - **Recommended Fix:** Depend on an interface abstraction (e.g. Interface or Base contract) instead of concrete class 'StringRedisTemplate'.

20. **[DIP] Dependency 'redisRateLimiter' of type 'RedisRateLimiter' in class 'RateLimitInterceptor' is bound directly to a concrete implementation class.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\config\RateLimitInterceptor.java#L23](file:///../NexTradeX/src/main/java/com/NexTradeX/config/RateLimitInterceptor.java#L23)
   - **Severity:** High
   - **Recommended Fix:** Depend on an interface abstraction (e.g. Interface or Base contract) instead of concrete class 'RedisRateLimiter'.

21. **[SRP] Class 'BinanceService' exposes 17 public methods, exceeding maximum threshold of 10.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L21](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L21)
   - **Severity:** High
   - **Recommended Fix:** Split public interface of 'BinanceService' into targeted interfaces or distinct component classes.

22. **[ISP] Concrete service class 'BinanceService' exposes 17 public methods without implementing any interface abstraction.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L21](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L21)
   - **Severity:** High
   - **Recommended Fix:** Extract segregated, role-specific interfaces for 'BinanceService' so consumers are not forced to depend on unneeded methods.

23. **[OCP] Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L95](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L95)
   - **Severity:** High
   - **Recommended Fix:** Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle).

24. **[OCP] Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L108](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L108)
   - **Severity:** High
   - **Recommended Fix:** Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle).

25. **[OCP] Switch statement detected. Adding new types requires modifying existing logic instead of extending via polymorphism.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L121](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L121)
   - **Severity:** High
   - **Recommended Fix:** Replace switch block with Strategy pattern or polymorphic sub-classes (Open-Closed Principle).

26. **[ISP] Concrete service class 'JwtService' exposes 13 public methods without implementing any interface abstraction.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\auth\JwtService.java#L22](file:///../NexTradeX/src/main/java/com/NexTradeX/auth/JwtService.java#L22)
   - **Severity:** High
   - **Recommended Fix:** Extract segregated, role-specific interfaces for 'JwtService' so consumers are not forced to depend on unneeded methods.

27. **[ISP] Concrete service class 'AuthController' exposes 6 public methods without implementing any interface abstraction.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\auth\AuthController.java#L17](file:///../NexTradeX/src/main/java/com/NexTradeX/auth/AuthController.java#L17)
   - **Severity:** High
   - **Recommended Fix:** Extract segregated, role-specific interfaces for 'AuthController' so consumers are not forced to depend on unneeded methods.

28. **[DIP] Dependency 'redisRateLimiter' of type 'RedisRateLimiter' in class 'RedisRateLimiterTest' is bound directly to a concrete implementation class.**
   - **File:** [..\NexTradeX\src\test\java\com\NexTradeX\config\RedisRateLimiterTest.java#L12](file:///../NexTradeX/src/test/java/com/NexTradeX/config/RedisRateLimiterTest.java#L12)
   - **Severity:** High
   - **Recommended Fix:** Depend on an interface abstraction (e.g. Interface or Base contract) instead of concrete class 'RedisRateLimiter'.

29. **[SRP] Class 'WalletService' exposes 13 public methods, exceeding maximum threshold of 10.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\wallet\WalletService.java#L14](file:///../NexTradeX/src/main/java/com/NexTradeX/wallet/WalletService.java#L14)
   - **Severity:** Medium
   - **Recommended Fix:** Split public interface of 'WalletService' into targeted interfaces or distinct component classes.

30. **[OCP] Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\order\OrderMatchingScheduler.java#L35](file:///../NexTradeX/src/main/java/com/NexTradeX/order/OrderMatchingScheduler.java#L35)
   - **Severity:** Medium
   - **Recommended Fix:** Refactor conditional chain into polymorphic dispatch or Factory pattern.

31. **[SRP] Class 'UserService' exposes 14 public methods, exceeding maximum threshold of 10.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\user\UserService.java#L13](file:///../NexTradeX/src/main/java/com/NexTradeX/user/UserService.java#L13)
   - **Severity:** Medium
   - **Recommended Fix:** Split public interface of 'UserService' into targeted interfaces or distinct component classes.

32. **[SRP] Class 'MarketService' exposes 11 public methods, exceeding maximum threshold of 10.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\market\MarketService.java#L28](file:///../NexTradeX/src/main/java/com/NexTradeX/market/MarketService.java#L28)
   - **Severity:** Medium
   - **Recommended Fix:** Split public interface of 'MarketService' into targeted interfaces or distinct component classes.

33. **[OCP] Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceWebSocketService.java#L79](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceWebSocketService.java#L79)
   - **Severity:** Medium
   - **Recommended Fix:** Refactor conditional chain into polymorphic dispatch or Factory pattern.

34. **[OCP] Cascading if-else chain (4 branches) inspecting type flags. Modifying behavior requires editing existing code.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L56](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L56)
   - **Severity:** Medium
   - **Recommended Fix:** Refactor conditional chain into polymorphic dispatch or Factory pattern.

35. **[OCP] Cascading if-else chain (4 branches) inspecting type flags. Modifying behavior requires editing existing code.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L71](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L71)
   - **Severity:** Medium
   - **Recommended Fix:** Refactor conditional chain into polymorphic dispatch or Factory pattern.

36. **[OCP] Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L94](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L94)
   - **Severity:** Medium
   - **Recommended Fix:** Refactor conditional chain into polymorphic dispatch or Factory pattern.

37. **[OCP] Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L154](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L154)
   - **Severity:** Medium
   - **Recommended Fix:** Refactor conditional chain into polymorphic dispatch or Factory pattern.

38. **[OCP] Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L169](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L169)
   - **Severity:** Medium
   - **Recommended Fix:** Refactor conditional chain into polymorphic dispatch or Factory pattern.

39. **[OCP] Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L453](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L453)
   - **Severity:** Medium
   - **Recommended Fix:** Refactor conditional chain into polymorphic dispatch or Factory pattern.

40. **[OCP] Cascading if-else chain (3 branches) inspecting type flags. Modifying behavior requires editing existing code.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\binance\BinanceService.java#L469](file:///../NexTradeX/src/main/java/com/NexTradeX/binance/BinanceService.java#L469)
   - **Severity:** Medium
   - **Recommended Fix:** Refactor conditional chain into polymorphic dispatch or Factory pattern.

41. **[SRP] Class 'JwtService' exposes 13 public methods, exceeding maximum threshold of 10.**
   - **File:** [..\NexTradeX\src\main\java\com\NexTradeX\auth\JwtService.java#L22](file:///../NexTradeX/src/main/java/com/NexTradeX/auth/JwtService.java#L22)
   - **Severity:** Medium
   - **Recommended Fix:** Split public interface of 'JwtService' into targeted interfaces or distinct component classes.
