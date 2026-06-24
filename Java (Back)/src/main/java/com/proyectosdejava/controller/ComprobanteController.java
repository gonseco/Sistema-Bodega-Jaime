package com.proyectosdejava.controller;

import com.proyectosdejava.model.ComprobanteDTO;
import com.proyectosdejava.model.Comprobante;
import com.proyectosdejava.model.DetalleComprobanteDTO;
import com.proyectosdejava.model.DetalleComprobante;
import com.proyectosdejava.service.ComprobanteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comprobante")
public class ComprobanteController {

    @Autowired
    private ComprobanteService comprobanteService;

    @GetMapping
    public ResponseEntity<List<ComprobanteDTO>> buscar(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) Integer estado) {
        return ResponseEntity.ok(comprobanteService.buscar(tipo, estado));
    }

    @GetMapping("/{id}/detalle")
    public ResponseEntity<List<DetalleComprobanteDTO>> listarDetalle(@PathVariable Integer id) {
        return ResponseEntity.ok(comprobanteService.listarDetalle(id));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody Comprobante request) {
        Map<String, Object> respuesta = comprobanteService.crear(
                request.getIdUsuario(),
                request.getTipo(),
                request.getSerie(),
                request.getNombreCliente(),
                request.getRucCliente()
        );
        String mensaje = (String) respuesta.get("mensaje");
        HttpStatus status = mensaje.startsWith("OK") ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(respuesta);
    }

    @PostMapping("/{id}/detalle")
    public ResponseEntity<Map<String, String>> agregarDetalle(
            @PathVariable Integer id,
            @RequestBody DetalleComprobante request) {
        Map<String, String> respuesta = comprobanteService.agregarDetalle(
                id, request.getIdProducto(), request.getCantidad(), request.getPrecioUnitario()
        );
        HttpStatus status = respuesta.get("mensaje").startsWith("OK") ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(respuesta);
    }

    @PatchMapping("/{id}/anular")
    public ResponseEntity<Map<String, String>> anular(@PathVariable Integer id) {
        Map<String, String> respuesta = comprobanteService.anular(id);
        HttpStatus status = respuesta.get("mensaje").startsWith("OK") ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(respuesta);
    }
}