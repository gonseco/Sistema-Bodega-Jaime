package com.proyectosdejava.controller;

import com.proyectosdejava.model.DetalleOrdenCompraDTO;
import com.proyectosdejava.model.DetalleOrdenCompra;
import com.proyectosdejava.model.OrdenCompraDTO;
import com.proyectosdejava.model.OrdenCompra;
import com.proyectosdejava.service.OrdenCompraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orden-compra")
public class OrdenCompraController {

    @Autowired
    private OrdenCompraService ordenCompraService;

    @GetMapping
    public ResponseEntity<List<OrdenCompraDTO>> buscar(@RequestParam(required = false) String estado) {
        return ResponseEntity.ok(ordenCompraService.buscar(estado));
    }

    @GetMapping("/{id}/detalle")
    public ResponseEntity<List<DetalleOrdenCompraDTO>> listarDetalle(@PathVariable Integer id) {
        return ResponseEntity.ok(ordenCompraService.listarDetalle(id));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody OrdenCompra request) {
        Map<String, Object> respuesta = ordenCompraService.crear(request.getIdProveedor(), request.getIdUsuario());
        String mensaje = (String) respuesta.get("mensaje");
        HttpStatus status = mensaje.startsWith("OK") ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(respuesta);
    }

    @PostMapping("/{id}/detalle")
    public ResponseEntity<Map<String, String>> agregarDetalle(
            @PathVariable Integer id,
            @RequestBody DetalleOrdenCompra request) {
        Map<String, String> respuesta = ordenCompraService.agregarDetalle(
                id, request.getIdProducto(), request.getCantidad(), request.getPrecioUnitario()
        );
        HttpStatus status = respuesta.get("mensaje").startsWith("OK") ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(respuesta);
    }

    @PatchMapping("/{id}/anular")
    public ResponseEntity<Map<String, String>> anular(@PathVariable Integer id) {
        Map<String, String> respuesta = ordenCompraService.anular(id);
        HttpStatus status = respuesta.get("mensaje").startsWith("OK") ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(respuesta);
    }
}
