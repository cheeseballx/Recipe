package de.andy.web.recipe;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class RecipeApplicationTests {

	@Test
    @DisplayName("should be Database loading 😱")
    void testWithDisplayNameContainingEmoji() {
		/*this empty test goes imeadatly wrong when no db is there or wrong 
		settigns in application. 
		
		Hopefully it is database always*/
    }

}
