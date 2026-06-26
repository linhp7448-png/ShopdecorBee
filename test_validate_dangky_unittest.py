import unittest
from validate_dangky import ValidateDangKy


class ValidateDangKyTests(unittest.TestCase):
    def test_boundary_valid_min(self):
        self.assertTrue(ValidateDangKy(10, 2.0, 0, 1))

    def test_boundary_invalid_outside_max(self):
        self.assertFalse(ValidateDangKy(26, 4.0, 3, 10))

    def test_nominal_valid(self):
        self.assertTrue(ValidateDangKy(18, 3.0, 2, 5))

    def test_invalid_gpa_outside_range(self):
        self.assertFalse(ValidateDangKy(15, 1.9, 1, 3))


if __name__ == "__main__":
    unittest.main()
