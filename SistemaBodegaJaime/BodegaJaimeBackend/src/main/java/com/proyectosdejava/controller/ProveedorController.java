package com.proyectosdejava.controller;

import com.proyectosdejava.model.Proveedor;
import com.proyectosdejava.model.ProveedorDTO;
import com.proyectosdejava.service.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proveedor")
public class ProveedorController {

    @Autowired
    private ProveedorService proveedorService;

    @GetMapping("/listar-activos")
    public ResponseEntity<List<ProveedorDTO>> buscarActivos(@RequestParam(required = false) String nombre) {
        return ResponseEntity.ok(proveedorService.buscarActivos(nombre));
    }

    @GetMapping("/listar-inactivos")
    public ResponseEntity<List<ProveedorDTO>> buscarInactivos(@RequestParam(required = false) String nombre) {
        return ResponseEntity.ok(proveedorService.buscarInactivos(nombre));
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> crear(@RequestBody Proveedor proveedor) {
        Map<String, String> respuesta = proveedorService.crear(
                proveedor.getNombre(), proveedor.getRuc(), proveedor.getTelefono(), proveedor.getDireccion()
        );
        HttpStatus status = respuesta.get("mensaje").startsWith("OK") ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(respuesta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> editar(@PathVariable Integer id, @RequestBody Proveedor proveedor) {
        Map<String, String> respuesta = proveedorService.editar(
                id, proveedor.getNombre(), proveedor.getRuc(), proveedor.getTelefono(), proveedor.getDireccion()
        );
        HttpStatus status = respuesta.get("mensaje").startsWith("OK") ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(respuesta);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Map<String, String>> cambiarEstado(@PathVariable Integer id, @RequestParam Integer valor) {
        Map<String, String> respuesta = proveedorService.cambiarEstado(id, valor);
        HttpStatus status = respuesta.get("mensaje").startsWith("OK") ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(respuesta);
    }
}
