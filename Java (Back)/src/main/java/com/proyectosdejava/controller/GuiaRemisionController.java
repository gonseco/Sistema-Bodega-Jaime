package com.proyectosdejava.controller;

import com.proyectosdejava.model.DetalleGuiaRemisionDTO;
import com.proyectosdejava.model.DetalleGuiaRemision;
import com.proyectosdejava.model.GuiaRemisionDTO;
import com.proyectosdejava.model.GuiaRemision;
import com.proyectosdejava.service.GuiaRemisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/guia-remision")
public class GuiaRemisionController {

    @Autowired
    private GuiaRemisionService guiaRemisionService;

    @GetMapping
    public ResponseEntity<List<GuiaRemisionDTO>> buscar(@RequestParam(required = false) Integer idOrdenCompra) {
        return ResponseEntity.ok(guiaRemisionService.buscar(idOrdenCompra));
    }

    @GetMapping("/{id}/detalle")
    public ResponseEntity<List<DetalleGuiaRemisionDTO>> listarDetalle(@PathVariable Integer id) {
        return ResponseEntity.ok(guiaRemisionService.listarDetalle(id));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody GuiaRemision request) {
        Map<String, Object> respuesta = guiaRemisionService.crear(
                request.getIdOrdenCompra(), request.getIdUsuario(), request.getNumeroGuia()
        );
        String mensaje = (String) respuesta.get("mensaje");
        HttpStatus status = mensaje.startsWith("OK") ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(respuesta);
    }

    @PostMapping("/{id}/detalle")
    public ResponseEntity<Map<String, String>> agregarDetalle(
            @PathVariable Integer id,
            @RequestBody DetalleGuiaRemision request) {
        Map<String, String> respuesta = guiaRemisionService.agregarDetalle(
                id, request.getIdProducto(), request.getCantidad()
        );
        HttpStatus status = respuesta.get("mensaje").startsWith("OK") ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(respuesta);
    }

    @PatchMapping("/{id}/anular")
    public ResponseEntity<Map<String, String>> anular(@PathVariable Integer id) {
        Map<String, String> respuesta = guiaRemisionService.anular(id);
        HttpStatus status = respuesta.get("mensaje").startsWith("OK") ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(respuesta);
    }
}