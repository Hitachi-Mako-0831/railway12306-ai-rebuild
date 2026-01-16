class AppException(Exception):
    def __init__(self, code: int, message: str) -> None:
        self.code = code
        self.message = message


class AuthenticationException(AppException):
    pass


class ValidationException(AppException):
    pass

