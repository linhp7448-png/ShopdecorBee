import pytest
from validate_dangky import ValidateDangKy


def test_boundary_valid_min():
    assert ValidateDangKy(10, 2.0, 0, 1) is True


def test_boundary_invalid_outside_max():
    assert ValidateDangKy(26, 4.0, 3, 10) is False


def test_nominal_valid():
    assert ValidateDangKy(18, 3.0, 2, 5) is True


def test_invalid_gpa_outside_range():
    assert ValidateDangKy(15, 1.9, 1, 3) is False
