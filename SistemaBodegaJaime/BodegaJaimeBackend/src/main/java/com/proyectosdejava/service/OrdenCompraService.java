package com.proyectosdejava.service;

import com.proyectosdejava.model.DetalleOrdenCompraDTO;
import com.proyectosdejava.model.OrdenCompraDTO;
import com.proyectosdejava.repository.OrdenCompraRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrdenCompraService {

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;

    public List<OrdenCompraDTO> buscar(String estado) {
        return ordenCompraRepository.buscar(estado);
    }

    public List<DetalleOrdenCompraDTO> listarDetalle(Integer idOrdenCompra) {
        return ordenCompraRepository.listarDetalle(idOrdenCompra);
    }

    @Transactional
    public Map<String, Object> crear(Integer idProveedor, Integer idUsuario) {
        Object[] resultado = ordenCompraRepository.crear(idProveedor, idUsuario);
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("idGenerado", resultado[0]);
        respuesta.put("mensaje", resultado[1]);
        return respuesta;
    }

    @Transactional
    public Map<String, String> agregarDetalle(Integer idOrdenCompra, Integer idProducto, Integer cantidad, BigDecimal precioUnitario) {
        return buildRespuesta(ordenCompraRepository.agregarDetalle(idOrdenCompra, idProducto, cantidad, precioUnitario));
    }

    @Transactional
    public Map<String, String> anular(Integer idOrdenCompra) {
        return buildRespuesta(ordenCompraRepository.anular(idOrdenCompra));
    }

    private Map<String, String> buildRespuesta(String resultado) {
        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", resultado);
        return respuesta;
    }
}
