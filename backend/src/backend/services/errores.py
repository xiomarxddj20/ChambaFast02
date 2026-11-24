class ErrorNegocio(Exception):
    """Error esperado que la API convierte en una respuesta HTTP."""
    def __init__(self, mensaje: str, codigo: int = 400):
        super().__init__(mensaje)
        self.codigo = codigo
