import java.io.FileInputStream;
import java.util.Properties;

public class TestEnv {
    public static void main(String[] args) {
        // 1. Check System Environment variables
        System.out.println("--- System Env ---");
        System.out.println("REDIS_HOST: " + System.getenv("REDIS_HOST"));
        System.out.println("REDIS_PORT: " + System.getenv("REDIS_PORT"));
        System.out.println("REDIS_PASSWORD: " + System.getenv("REDIS_PASSWORD"));
        
        // 2. Check if .env file is readable as properties
        System.out.println("--- .env file content ---");
        try (FileInputStream fis = new FileInputStream(".env")) {
            Properties props = new Properties();
            props.load(fis);
            System.out.println("DB_URL: " + props.getProperty("DB_URL"));
            System.out.println("REDIS_HOST from .env: " + props.getProperty("REDIS_HOST"));
            System.out.println("REDIS_PORT from .env: " + props.getProperty("REDIS_PORT"));
            System.out.println("REDIS_PASSWORD from .env: " + props.getProperty("REDIS_PASSWORD"));
        } catch (Exception e) {
            System.out.println("Error reading .env: " + e.getMessage());
        }
    }
}
