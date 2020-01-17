package de.andy.web.recipe.swagger;

import java.util.ArrayList;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.*;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class SwaggerConfiguration {
 
    @Bean
    public OpenAPI customOpenAPI() {

        Contact contact = new Contact();
        contact.setEmail("gladisch.andreas@gmail.com");
        contact.setName("Andreas Gladisch");
        
        Info info = new Info();
        info.setTitle("RECIPE");
        info.setDescription("Load, edit, work on Recipes");
        info.setVersion("0.1");
        info.setContact(contact);

        Server server1 = new Server();
        Server server2 = new Server();
        server1.setUrl("http://localhost:3001");
        server2.setUrl("http://127.0.0.1:3001");
        
        ArrayList<Server> servers = new ArrayList<>();
        servers.add(server1);
        servers.add(server2);

        return new OpenAPI().info(info).servers(servers);
    }
}