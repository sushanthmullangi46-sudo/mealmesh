package com.mealmesh.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * The React frontend is a single-page app bundled into this jar (src/main/resources/static).
 * Page URLs such as /donor or /admin are routes inside React, not files on the server,
 * so they are forwarded to index.html and React decides what to show.
 * API calls (/api/**) and real files (anything with a dot, e.g. /assets/app.js) are not affected.
 */
@Controller
public class SpaForwardController {

    @GetMapping({"/landing", "/login", "/donor", "/ngo", "/volunteer", "/admin",
                 "/dsa-lab", "/visualizer", "/analytics"})
    public String forwardToReactApp() {
        return "forward:/index.html";
    }
}
